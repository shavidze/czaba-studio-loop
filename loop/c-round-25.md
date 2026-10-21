# C — Round 25 ვერიფიკაცია (SRW-13 ეტაპი 1: Master Volume, Master Mute, export-ის გადატვირთვის გაფრთხილება; D-29p)

Verifier: C · 2026-10-11 · Store: `C:/Apps/czaba-project/store`, HEAD `c5ed47b` + round-6..25 dirty tree · Dev server: არსებული `http://127.0.0.1:5173` (არ დამიწყია/გამიჩერებია) · Browser: gstack browse, state `c-browse.json`.

## 1. ვერდიქტი

**taskStatus: PASS.** ამ round-ის scope-ში ახალი ბაგი არ არის. A-ს ციფრებს არ ვენდე; ყველა შედეგი ჩემი გაშვებაა.

ერთი მნიშვნელოვანი ცვლილება ღია ბაგზე: **C-R23-01** (SSR NUL) გაიზარდა 4-დან **8** NUL-მდე. ახლა ის SSR HTML-ში ხილულ ტექსტსაც აზიანებს (header-ის დემო badge, library, `Arrangement ·` სათაური). Hydration-ის შემდეგ ტექსტი სწორდება. task §4.9-ის მიხედვით ეს C-R23-01-ის ჩანაწერია, არა ამ round-ის ბაგი (Master-ის label-ები სუფთაა). დეტალები §12-ში.

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R25-MV | **PASS** (3/3 ვალიდური) | `c-round-25/runs/mv-1..3.txt`, `mv-summary.txt` |
| R25-MM | **PASS** (≤−60 / unmute: 3/3; de-click shape: 3 ვალიდური + 1 ჩანაცვლება) | `runs/mm-1..4,6,7.txt`, `mm-summary.txt`, `mm-shape-summary.txt`, `mm-5.INVALID-ref-raw-dropout.txt`, `vm-1.txt` |
| R25-ML | **PASS** | `runs/mv-*.txt`, `mm-*.txt` (`newGraphs`, `starts`), `vm-1.txt`, `ur-1.txt` (seam) |
| R25-E0 | **PASS** (r24-ის bytes არ შემინახავს; იხ. §5) | `runs/export-E0a.txt`, `export-E0b.txt`, `export-E0c.txt`, `export-E0a-vs-E0b.txt`, `export-E0a-vs-E0c.txt` |
| R25-EO | **PASS** | `runs/export-E0a.txt`, `export-E6-ratio.txt`, `export-ER.txt` |
| R25-E6 | **PASS** | `runs/export-E6.txt`, `export-E6-ratio.txt` |
| R25-EM | **PASS** | `runs/export-EM.txt`, `shots/export-EM.png` |
| R25-H | **PASS** | `runs/h-prior.txt`, `h-12keys.txt`, `h-mute.txt`, `h-drag-synthetic.txt`, `ur-1.txt` (audio follows Undo/Redo) |
| R25-K (1440 + 1280) | **PASS** | `runs/k-taborder-1440.txt`, `k-taborder-1280.txt`, `k-fader-keys-1440.txt`, `k-fader-keys-1280.txt`, `k-space-1440.txt`, `k-readout-extreme-1280.txt` |
| R25-L (1440 + 1280) | **PASS** | `runs/geo-1440.txt`, `geo-1280.txt`, `p2a-1440.txt`, `p2a-1280.txt`, `fv-1440.txt`, `shots/header-1440.png`, `header-1280.png`, `header-1280-minus60.png`, `fv-1440.png` |
| R25-R | **PASS** | `runs/rv22-R-M1_1.txt`, `rv22-R-M2_1.txt`, `r-solo-video.txt`, `vm-1.txt`, `r-drops-1440.txt`, `r-home-body.txt` |
| R25-S | **PASS** | `gates/snap-*-start.diff` = `-end.diff`, `gates/r25s-static.txt` |
| R25-U | **PASS** | `runs/r25u-control.txt`, `r25u-mutA..D.txt`, `r25u-mutA..D.diff` |
| R25-Doc | **PASS** | doc 031 (წავიკითხე, კოდს ემთხვევა) |
| G25-1 | **PASS** | `gates/tsc.txt`, `vitest-new.txt`, `vitest-frozen4.txt`, `vitest-all.txt`, `biome-app.txt`, `biome-owned.txt`, `build.txt` |
| G25-2 (start + end) | **PASS** | `gates/head-*.txt`, `git-status-*`, `sha-b24-*.txt`, `protected-*.txt`, `header-diff-*.txt`, `forbidden-status-*.txt`, `owned-sha-*.txt` |
| G25-3 | **PASS** | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| Browser render-budget (დამატებით) | **PASS** | `runs/render-count-browser.txt` |
| C-R23-01 info record | **არც PASS, არც FAIL** — **გაუარესდა** (4 → 8 NUL) | `runs/c-r23-01-record.txt`, `runs/ssr-1..3.html` |

**ამ round-ში არ გაშვებულა** (task §4.9; video/dock/scheduler/transport/loop კოდი არ შეცვლილა, G25-2 ამას ადასტურებს): RF5-3, R3-V1, R3-V4, R11-P3 sync. ისინი round 25-ისთვის PASS არ არის.

## 2. Harness და setup

- „რეალური click“ = `$B click <selector>` ელემენტის ცენტრზე; key = რეალური `$B press` (CDP key event).
- **Synthetic ნაწილები (გულახდილად):**
  - fader-ზე focus `element.focus()`-ით (Tab-ის რიგი ცალკე რეალური Tab-ით შემოწმდა, §8);
  - playhead-ის seek 5 წმ-ზე: ruler-ზე synthetic pointer (`C.seekRuler`), როგორც round 24-ში;
  - loop 8–12: `C.rangeOn` + Ctrl+L (round 6-ის `looplay.js`-ის მეთოდი);
  - ერთი-entry-ის drag: synthetic `PointerEvent` + `input` event-ები (R25-H, task-ის მიხედვით);
  - Play/Pause გაზომვის script-ებში: `button.click()` JS-იდან (ზომვის დასაწყისის სინქრონისთვის). ყველა Master ცვლილება (keys, Mute click) რეალურია.
- **Tap:** round 2-ის master tap (ყველა node → destination ასევე tap-ში; app-ის master GainNode → destination, ე.ი. tap **master gain-ის შემდეგ**ა) და round 22-ის raw-sample worklet (`c-round-22/scripts/sp22.js`). წყაროში არაფერი შემიცვლია.
- Setup: `c-round-25/setup.sh` (round 24-ის setup) + `lay11`. Media მხოლოდ `media/`-დან (synthetic beeps), გარეთ არაფერი ატვირთულა.
- **Clip table (`runs/lay11-1440.txt`, `lay11-export.txt`, `lay11-1280.txt`):** video 0–6.008 (`beeps-6s-vp9-opus.webm`), music 0–16 (`სრული მიქსი`), stems 2–18 (`პულსი`), SFX 4–6 (`Soft impact`).
- გვერდები: (1) 1440 live/history/keys, (2) სუფთა 1440 export-ებისთვის, (3) სუფთა 1280 layout/keys, (4) ახალი anonymous context (G25-3), (5) სუფთა 1440 drops/Home.
- წინასწარ რეგისტრირებული წესები: `c-round-25/checkpoint.md` (მონაცემების ნახვამდე დაწერილი).

## 3. R25-MV — Master Volume ცოცხლად (`runs/mv-*.txt`)

**მეთოდი (harness-ის არჩევანი):** loop 8–12 ჩართულია, Play 8-დან, raw tap უწყვეტად 24 წმ. ერთი და იგივე loop-ის ფაზა (pos 9–10, ე.ი. ctx `[4k+1, 4k+2]`) სხვადასხვა pass-ში. ასე მუსიკის შინაარსი ერთნაირია და ±0.3 dB-ის oracle სამართლიანია. მეორადი: სრული 4 წმ-იანი pass-ის RMS. −6 = 12 × რეალური `ArrowDown` ფოკუსირებულ fader-ზე, აღდგენა = 12 × `ArrowUp`.

| Run | 0 dB (pass 0) | −6 dB (pass 2) | **Δ** | აღდგენა (pass 5) | Δ აღდგენა | ახალი graph | Playhead |
|---|---|---|---|---|---|---|---|
| 1 | −15.416 | −21.416 | **−6.000** | −15.416 | 0.000 | 0 | 6 wrap, უკან ნაბიჯი 0 |
| 2 | −15.416 | −21.416 | **−6.000** | −15.416 | 0.000 | 0 | 6 wrap, 0 |
| 3 | −15.416 | −21.416 | **−6.000** | −15.416 | 0.000 | 0 | 6 wrap, 0 |

- Readout key-ების შემდეგ `−6.0 dB`, აღდგენის შემდეგ `0.0 dB`.
- Oracle −6.0 ±0.3 ✓; აღდგენა ±0.3 ✓ (სამივე run-ში 0.000). Pass 1 და 3 ცვლილებებს ფარავს და მხოლოდ ინფორმაციულია (მაგ. run 1-ში −16.29 / −21.42).
- Spy: master-ის ყოველი ნაბიჯი = `setTargetAtTime` τ **0.015** (არანულოვანი → არანულოვანი), ერთი press-ზე 2 გამოძახება (keydown preview + keyup commit), ბოლო target 0.50119.
- Playhead: 1492 rAF ჩანაწერი. Position ctx-ს მისდევს, max |Δpos − Δctx| 18–21 ms (rAF jitter; wrap-ზე 4 წმ-ით გასწორებით). ნახტომი და restart არ ყოფილა.
- **ვიდეოს sync-ის sample (R3-V2-ის სტილით, `vm-1.txt`):** Play 0-დან, Master Mute/unmute და 12 × ArrowDown 3.38–5.09 წმ-ზე. აქტიური `<video>` არასდროს გაჩერებულა, ყოველ frame-ზე muted, `<video>` 2. Play-ის შემდეგ start-ები +0, stop +0. Dock counter-ები 0 → 0 (swaps/fallbacks/hardSeeks/escalations). |video.currentTime − pos| max **19.6 ms** (საშუალო 12.8 ms). Round 22-ის R22-V კრიტერიუმები (paused/muted/start/dock) ყველა სრულდება; drift ≤ round 21-ის 47 ms-ზე.

## 4. R25-MM — Master Mute ცოცხლად

### 4.1 Music window (`runs/mm-1..3.txt`, `mm-summary.txt`)

Loop 8–12, Play 8-დან. რეალური click `Master Mute`-ზე ~4.6–5.3 წმ-ზე, unmute ~5 წმ-ის შემდეგ.

| Run | click (ctx) | Master spy | ≤−60 dBFS-მდე | max ბლოკი ≥60 ms-ის შემდეგ | Unmute: 1 წმ (60 ms-იდან) vs იგივე ფაზა pass 0 | overshoot (2 ms) |
|---|---|---|---|---|---|---|
| 1 | 4.5713 | 1 → 0 τ 0.003, startTime = click | 14 ms | **−240** (ციფრული ნული) | −15.83 / −15.83, **Δ 0.00** | **0.00 dB** |
| 2 | 5.2487 | იგივე | 14 ms | **−240** | −15.63 / −15.63, Δ 0.00 | 0.00 |
| 3 | 5.1900 | იგივე | 14 ms | **−240** | −15.63 / −15.63, Δ 0.00 | 0.00 |

- `aria-pressed` click-ზე `true`, მეორე click-ზე `false`. Footer-ის status **უცვლელი** ორივე click-ზე (`statusSame=yes`). Undo `Undo: Master Mute`.
- Unmute-ის 2 ms ბლოკები reference-თან შედარებით: −8.3, −4.2, −1.9, −1.0, −0.5, −0.2 … 0.00. ე.ი. გლუვი აწევა overshoot-ის გარეშე.
- `mm-an.js` spy-ის სიაში `target 1` გამოძახებებს ფილტრავს, ამიტომ mm-1..7-ში ჩანს მხოლოდ mute-ის `1 → 0 τ 0.003`. Unmute-ის `0 → 1 τ 0.003` ცოცხლად `ur-1.txt`-შია დაფიქსირებული (§7).
- **Raw ბლოკების monotone (task-ის სიტყვასიტყვით):** run 3-ში დარღვევა 0. Run 1-ში 2 ms-ზე −21.13 → −19.34 და 26 ms-ზე −93.2 → −89.0; run 2-ში 20 ms-ზე −72.6 → −72.1. ეს მუსიკის შინაარსია decay-ის შიგნით და click არ არის: არცერთი ბლოკი mute-მდე დონეს არ აღემატება. ამიტომ წინასწარ რეგისტრირებული წესით shape-ი ცალკე, შინაარსისგან გაწმენდილი მეთოდით გავზომე (§4.2).

### 4.2 De-click shape (`runs/mm-shape-summary.txt`)

**მეთოდი:** gain(t) = raw 2 ms ბლოკი − იმავე loop ფაზის ბლოკი pass 0-ში (mute-მდე). ასე მუსიკის შინაარსი ქრება და რჩება მხოლოდ master gain-ის მრუდი.

**გულახდილად მეთოდის შეცვლაზე:** `checkpoint.md`-ში წინასწარ სხვა მეთოდი დავარეგისტრირე: steady beep (video), 0.0 dB ტოლერანსით. Gain-vs-reference მეთოდი და მისი 0.3 dB ტოლერანსი mm-1..3-ის ნახვის შემდეგ შევარჩიე, რადგან music-ის raw ბლოკებში შინაარსი ერია, ხოლო beep-ზე click-ის დამთხვევა იშვიათია. **შედეგი ტოლერანსზე არ არის დამოკიდებული:** run 4/6/7-ში gain −100 dB-ზე მაღალ ყოველ ბლოკზე 2 ms-იდან **მკაცრად კლებადია**, ანუ 0.0 dB ტოლერანსითაც PASS-ია (ჩემი ხელახალი შემოწმება: rises 0/0/0). −100 dB-ის ქვემოთ ორივე ბლოკი ციფრული სიჩუმეა, ამიტომ ratio უაზროა.

| Run | gain 2 ms ბლოკებით (0 ms-იდან) | აწევა > 0.3 dB | ≤−60 |
|---|---|---|---|
| 4 | −2.6, −9.0, −14.8, −20.8, −26.7, −31.5, −38.3, −41.9, −49.0, −55.3, −62.0 … −88.7, შემდეგ ციფრული ნული | 0 | 14 ms |
| 6 | −1.1, −8.8, −14.1, −18.7, −25.9, −32.5, −36.4, −44.2, −49.5, −55.1, −59.5 … | 0 | 14 ms |
| 7 | −3.5, −8.4, −15.2, −18.7, −25.8, −32.1, −38.8, −41.9, −49.4, −53.8, −61.3 … | 0 | 14 ms |

- ≈ −6 dB / 2 ms = τ 3 ms-ის თეორიული დახრა (8.686 · 2/3 = 5.8 dB). Click არ არის.
- **Run 5 არავალიდურია (გარემო):** reference pass-ში raw worklet-ს ორი ბლოკი გამოტოვა (−240 მუსიკის შუაში), gain +220 dB გამოვიდა. ჩანაცვლება: run 7. ბიუჯეტი: 3 ვალიდური + 1 ჩანაცვლება (≤2).

### 4.3 Master Mute ვიდეოს ხმაზე (`runs/vm-1.txt`)

Music lane დადუმებული (რეალური click). Play 0-დან, Master Mute 0.83 წმ-ზე, unmute 2.56-ზე.
- beep 0 (მხოლოდ ვიდეო) **−9.04 dBFS**;
- beep 1 და 2 (+ შუალედები) **−240**: ვიდეოს ხმაც ჩუმდება ✓;
- beep 3 −8.57 (unmute; stems უკვე 2-დან ჟღერს).
- `<video>` ელემენტები ყოველთვის muted, ე.ი. ხმა მხოლოდ graph-იდან მოდის.

## 5. Export (რეალური `Export` → `WAV-ის ექსპორტი` → `დახურვა`, სუფთა `lay11`, 1440×900)

| ფაილი | Master | Frames / წმ | NaN | Header | FS (|x| ≥ 8388607) | Peak | RMS dBFS | Alert | sha256 (პრეფიქსი) |
|---|---|---|---|---|---|---|---|---|---|
| E0a | 0 dB | 864 000 / 18.000 | 0 | ✓ (5 184 044 B) | **1800** | 1.0 | **−15.481** | **ჩანს** | `db051982` |
| E0b | 0 dB | 864 000 | 0 | ✓ | 1800 | 1.0 | −15.481 | ჩანს | `4ca03c52` |
| E6 | −6.0 dB | 864 000 | 0 | ✓ | **0** | 0.8907177 | −21.399 | **არა** | `346200ff` |
| ER | −5.0 dB | 864 000 | 0 | ✓ | **0** | 0.9994018 | −20.399 | **არა** | `8a6adc97` |
| EM | Mute (−5.0) | 864 000 | 0 | ✓ | 0 | **0** | — (ციფრული ნული) | არა | `b70d55be` |
| E0c | 0 dB (აღდგენილი) | 864 000 | 0 | ✓ | 1800 | 1.0 | −15.481 | ჩანს | `282bbf4c` |

ყველა ფაილი: RIFF/WAVE, PCM, 2 ch, 48 kHz, 24-bit.

### 5.1 R25-E0
- 864 000 frame = 18.000 წმ, NaN 0, header სწორია ✓.
- FS **1800** და RMS **−15.48** (−15.481) = round 24 (`c-round-24/runs/export-sanity.txt`) ✓.
- Round 24-ის WAV bytes არ შემინახავს, ამიტომ byte-შედარება round 24-თან ვერ გაკეთდება (task-ის პირობითი პუნქტი არ მოქმედებს).
- **Determinism, დაკვირვება (ახალი ბაგი არ არის):** ერთსა და იმავე სესიაში ორი 0 dB export bit-იდენტური **არ არის**. E0a vs E0b: 9963 sample, ყველა **±1 LSB**, 2.000–5.991 წმ შუალედში. E0a vs E0c: 6120 sample ±1 LSB. ეს pipeline-ის ცნობილი თვისებაა: round 11-მა იგივე აღმოაჩინა (`c-round-11.md` l.65, maxDiff 1.192e-7). 0 dB-ზე `masterLinearGain` ზუსტად 1-ია, ამიტომ master node მიზეზი არ არის. ამ round-ის hash-ები ახალი reference-ია მხოლოდ ინფორმაციისთვის; byte-იდენტურობის oracle ამ pipeline-ზე შეუსრულებელია.

### 5.2 R25-EO
- Alert ჩანს, `role=alert`, class `text-sm text-accent` (destructive არ არის), ტექსტი:
  `გადატვირთვა: პიკი +5.0 dBFS — 1800 sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ 5.0 dB-ით და გაიმეორე ექსპორტი.`
  ეს §2.3-ის შაბლონს ზუსტად ემთხვევა.
- **N = 1800**, FS = 1800 → 0.99·FS ≤ N ≤ FS ✓.
- **P-ის დამოუკიდებელი შეფასება:** E6-ის decoded peak 0.8907177 / 10^(−6/20) = **1.77722** → **+4.995 dBFS**. Half-up ერთ ათწილადამდე → **+5.0** = alert-ის P ✓. R = ceil(49.95)/10 = **5.0** = alert ✓. (E6-ში FS 0, ამიტომ მასში clamp არ მომხდარა და peak სანდოა.)
- **რჩევის გამოყენება:** −R-ზე ან ქვემოთ პირველი 0.5 ნაბიჯი = −5.0 dB (2 × ArrowUp −6.0-იდან). Re-export **ER**: FS **0**, alert **არ ჩანს**, peak 0.9994 (მარაგი ≈ 0.005 dB) ✓.
- **Reset:** E0c-ის alert-ის შემდეგ `დახურვა` → dialog-ის ხელახლა გახსნა: alert არ არის, `exportState` = `{"phase":"idle","message":null}` (key `warning` არ არის) ✓.

### 5.3 R25-E6
- 864 000, NaN 0, FS 0, alert არ არის ✓.
- Gain note ექსპორტამდე და შემდეგ: `Master: −6.0 dB — ექსპორტში შედის.` ✓.
- **Ratio:** |x₀| < 0.9 და x₀ ≠ 0 (x₀ = 0 გაყოფის გამო 58 sample გამოვრიცხე; ეს ჩემი არჩევანია), n = 1 725 192: **median 0.501187** (p01 0.50112, p99 0.50125). |x₀| ≥ 0.01-ზე: median 0.501187, p01 0.501184, p99 0.501190. Oracle 0.5012 ±0.001 ✓.

### 5.4 R25-EM
- Master Mute (რეალური click, `aria-pressed=true`). Dialog **ექსპორტამდე**: `role=note` `Master დადუმებულია (M) — WAV შეიქმნება 00:18.000 სიგრძის სიჩუმით. ჩართე Master, თუ ხმა გჭირდება.` ✓. `WAV-ის ექსპორტი` ჩართულია (`disabled=false`) ✓.
- ფაილი: 864 000 frame, peak **0**, NaN 0, header სწორია ✓.
- Done: `WAV შეიქმნა: 00:18.000, 24-bit · 48 kHz · stereo. Master დადუმებულია — ფაილი სიჩუმეა.` ✓.
- **UX შენიშვნა (low, ბაგი არ არის):** mute-ის დროს gain ≠ 0-ზე dialog ორივე note-ს აჩვენებს: „სიჩუმე“ და `Master: −5.0 dB — ექსპორტში შედის.`. მეორე ტექსტი სიჩუმის ფაილთან ცოტა წინააღმდეგობრივად იკითხება. Spec ამას ნებას რთავს (ორი დამოუკიდებელი პირობა). B-მ შეიძლება stage 2-ში გადაწყვიტოს.

## 6. R25-ML — reschedule არ ხდება

- **ახალი graph:** `newGraphs` ყველა MV/MM/VM run-ში = 1, ანუ მხოლოდ Play-ის graph. Master-ის ცვლილებაზე ახალი master GainNode → destination კავშირი **0**.
- **Source start-ები:** MV-ში start-ები მხოლოდ loop-ის refill-ზეა: `at` = 2.0007/6.0007/10.0007…, `when` = ზუსტად 4/8/12/16/20/24 (horizon 2 წმ). Key-ების მომენტში (5.1–6.9, 14.1–15.8) start არ არის. MM-შიც იგივე.
- **Loop wrap master-ის ცვლილების შემდეგ:** pass 2 (wrap 8-ზე, ცვლილება ≤ 6.85-ზე) და pass 3 −21.416-ზე რჩება. Wrap-ის შემდეგ master დონე შენარჩუნებულია (loop iteration `appendPlan`-ით იგივე handle/master-ზე ემატება; წყარო წავიკითხე). Wrap-ის `when` ზუსტად 4k-ზეა, playhead-ს 6 wrap აქვს უკან ნაბიჯის გარეშე ✓.
- **R5-L3-ის მეტრიკა (`ur-1.txt`; ამ run-ში master 4-ჯერ შეიცვალა 5.15–14.26-ზე):** music iteration-ები `when` 0/4/8/12/16/20, dur 4, **seam 0 ms** ხუთივე wrap-ზე (`when(k+1)` = `when(k)+dur`), lead **1999.3 ms** (≥ 100). Wrap-ის ±50 ms-ში ყველაზე დაბალი 5 ms ფანჯარა: wrap 4 **−24.5**, wrap 16 **−24.5** dBFS (> −60). Wrap 16 მოდის master-ის ცვლილების (Undo, 14.26) შემდეგ. Wrap 8 და 12 Master Mute-ის შიგნითაა (−240, მოსალოდნელი). ეს round 21-ის ზღვრებშია (seam 0, lead ≥ 100, min > −60). MV run-ებში ეს მეტრიკა არ დამითვლია (`seam.js`-ის sample-შედარება მივატოვე); ის მხოლოდ `ur-1`-შია.

## 7. R25-H — history

| ცდა | შედეგი |
|---|---|
| Master Mute (რეალური click) | Undo `Undo: Master Mute`; Undo → `aria-pressed=false`, Redo `Redo: Master Mute`; Redo → `true`; Undo → `false`. Status-ის ხაზი click-ზე უცვლელია (`h-mute.txt`) |
| **Audio Undo/Redo-ს მისდევს** (`ur-1.txt`, loop 8–12, რეალური click-ები დაკვრისას) | Master Mute 5.15 → ≥60 ms-იდან **−240**; `Undo` 8.18 → **−18.83** vs იგივე ფაზა −18.83 (**Δ 0.00**), spy `0 → 1 τ 0.003`; `Redo` 11.13 → **−240**, spy `1 → 0 τ 0.003`; `Undo` 14.26 → −18.49 vs −18.44 (Δ −0.05). `aria-pressed` false/true/false, label-ები `Undo: Master Mute` / `Redo: Master Mute`. ახალი graph 0 |
| 5 რეალური key (Home, End, ↓, ↓, ↑) | 5 `Master Volume` entry; Undo × 5 → `0.0 dB` (`h-prior.txt`) |
| **12 × ArrowDown Master-ზე** | readout `−6.0 dB`; **N = 12** `Master Volume`; Undo × 12 → `0.0 dB`; Redo × 12 → `−6.0 dB` (Redo disabled ბოლოს); Undo × 12 → `0.0 dB` |
| **12 × ArrowDown `Volume — მუსიკა`-ზე** | 1 → 0.88; **N = 12** `Volume`; Undo × 12 → 1 |
| N(Master) = N(track) | **12 = 12** ✓ |
| Synthetic drag (pointerdown, 5 input: −1/−2.5/−4/−6/−3, pointerup) | drag-ის დროს Undo უცვლელი; ბოლოს **1** `Master Volume` entry, readout `−3.0 dB`; Undo × 1 → `0.0 dB` (`h-drag-synthetic.txt`) |
| Track label-ები | `Volume`, `Mute — ვიდეო`, `Solo — ვიდეო` (უცვლელი) |

## 8. R25-K — კლავიატურა და a11y

- **Tab-ის რიგი** (რეალური Tab `← CZABA`-დან), 1440 და 1280 ერთნაირია: `← CZABA` → **Master Mute** (button) → **Master Volume** (range) → **Play** → `დასაწყისზე დაბრუნება` → `Undo: …` → `✂ Split`.
- **Fader focus-ით, pos 5.000 (არანულოვანი):**

| Key | 1440 | 1280 |
|---|---|---|
| Home | `−60.0 dB`, pos **5 → 5** (seek არ ხდება), `defaultPrevented` false (native) | იგივე |
| End | `+6.0 dB`, pos 5 | იგივე |
| ArrowDown / ArrowUp | −0.5 / +0.5 dB | იგივე |
| Space | Play (pos 5 → 5.77), მეორე Space → Pause; value უცვლელი, `defaultPrevented` true, focus რჩება | იგივე |

- **Space-ის შედარება:** `Volume — მუსიკა`-ზე Space ზუსტად იგივეს აკეთებს: Play/Pause, value 1 უცვლელი, `defaultPrevented` true (`k-space-1440.txt`) ✓.
- Focus ყველა key-ის შემდეგ `Master Volume`-ზე რჩება, `scrollY` 0, scroller-ის `scrollLeft` უცვლელი.
- **A11y:** `<fieldset aria-label="Master">`, gstack-ის a11y snapshot: `[group] "Master"` → `[button] "Master Mute"`, `[slider] "Master Volume"`, text `+6.0 dB` (A-ს deviation 2 დადასტურდა). Mute-ს `aria-pressed` აქვს. `aria-valuetext` = readout ყოველ ნაბიჯზე (`0.0 dB`, `−60.0 dB`, `+6.0 dB`, `+5.5 dB` …).

## 9. R25-L — layout უცვლელია

| | 1440×900 | 1280×720 | Reference |
|---|---|---|---|
| Header | **35** | **35** | 35 |
| Transport | **49** | **87** | 49 / 87 |
| Master ჯგუფი | 860,7 256.9×20, FIELDSET | 700,7 256.9×20 | — |
| M / fader / readout | 20×20 / 96×4 / 64×16 | იგივე | fader ≥ 80 ✓ |
| Clipping | sw = cw ყველა ელემენტზე; readout `−60.0 dB` და `+6.0 dB` 64/64; doc scrollWidth = viewport | იგივე | — |
| Rows (`lay11`) | detail ღია 81×4, scroller **496**; დაკეცილი 81×4, **604** | დაკეცილი 81×4, **386**; ღია **53/61/61/61**, **280** | `c-round-24/runs/p2a-*.txt` ✓ |
| Refit mutation-ები | 1440: 0 (= r24) | ერთხელ, ოთხივე row-ზე 528/511 ms-ზე transitionend-ის (517/500) შემდეგ (= r24) | ✓ |
| Floating video (library დაკეცილი, ⤢) | **8,503 272×153**, ✕ → dock 1268,92 160×90 | — | `fv-1440.txt` ✓ |

Screenshot-ები: `shots/header-1440.png`, `header-1280.png`, `header-1280-minus60.png`, `fv-1440.png`. Master-ის ტექსტი არსად იჭრება.

**შენიშვნა (low, ბაგი არ არის):** fader-ის layout box 4 px სიმაღლისაა (`h-1`, thumb ვიზუალურად უფრო დიდია). ეს track Volume fader-ის იგივე pattern-ია (`ArrangementLane.tsx` l.509). Pointer-ის მიზანი პატარაა; fader-ის UX stage 4-შია დაგეგმილი (C round 22 §5).

## 10. R25-S — diff-ის აუდიტი (`gates/snap-*-start.diff` = `-end.diff`)

- **`types/arrangement.ts`** (+6): `ArrangementMaster` interface და სავალდებულო `master`.
- **`model.ts`**: import; `DEFAULT_ARRANGEMENT_MASTER`, `MASTER_GAIN_MIN_DB`/`MAX_DB`; `createArrangement`-ის default-ის ასლი; l.118-ის `projectEnd({... master })` literal (Biome-ით 4 ხაზად გადატანილი); `setMasterMix` (clamp, NaN-ის იგნორი, no-op-ზე იგივე ობიექტი), `masterLinearGain`, `formatMasterGainDb` (U+2212).
- **`graph.client.ts`**: import; `masterGain?` option; handle-ზე `setMasterGain`; `ExportOverloadReport`/`ArrangementWavResult`; `lastMasterTarget` (საწყისი option-იდან); `setMasterGain` (disconnect-ის შემდეგ no-op; τ წესი = `setTrackGain`); pure `measureExportOverload` (`>` MAX, `< −1`) და `formatExportOverloadWarning`; `renderArrangementWav` გადასცემს `masterGain`-ს, ზომავს raw არხებს, clamp **უცვლელია**, აბრუნებს `{blob, peak, clippedSamples}`-ს.
- **`ArrangementContext.tsx`**: import-ები; 3 label/suffix კონსტანტა; `warning?`; value-ს 6 წევრი; `MasterGainGesture`; 2 ref; `startGraph` `masterGain`; `syncPlayback`-ის no-reschedule შტოში `setMasterGain`; `flushPendingMaster` და მისი გამოძახება `applyEdit`/`undo`/`redo`/`beginTrackVolumeGesture`-ში; master action-ების ბლოკი; `exportWav` (destructure, suffix, `warning` მხოლოდ საჭიროებისას); unmount-ის release; value და deps. **`scheduleKey` უცვლელია** (`JSON.stringify([arrangement.clips, arrangement.loop])`, l.315–317).
- **`StudioWorkspace.tsx`**: მხოლოდ relative import და header-ის render (Master + badge ერთ flex div-ში). სხვა hunk არ არის.
- **`ArrangementExportDialog.tsx`**: `formatMasterGainDb` import, mute note, gain note, overload alert. სხვა არაფერი.
- **`schedule.test.ts`**: მხოლოდ fixture-ის ხაზი `master: { gainDb: 0, mute: false }` (literal, import hunk არ არის).
- **`ArrangementMaster.tsx`**: hardcoded ფერი 0 (token-ები: `border-outline`, `border-accent bg-accent text-background`, `text-muted`, `accent-brand`, `ring-brand`). Fader-ის wiring (`onChange`/`onPointerDown` button 0/`onPointerUp`/`onLostPointerCapture`/`onKeyUp` + `isPointerGestureActive`/`onBlur`) `ArrangementLane.tsx` l.487–510-ის ზუსტი ასლია.
- **Banned words:** `limiter|normaliz|compress` arrangement-ის კოდში/UI-ში და ახალ ტესტებში: მხოლოდ `normalizePeakColumns` (`peaks.ts`, `ArrangementLibraryPreview.tsx`). ეს არსებული waveform-ის ჩვენების კოდია, ამ round-ში არ შეცვლილა და აუდიოს normalization არ არის (`gates/r25s-static.txt`). Doc 031 ამ სიტყვებს მხოლოდ იმის სათქმელად იყენებს, რომ clamp limiter არ არის.

## 11. R25-U

- **A-ს red-first:** `a-round-25/red-live.txt` (master.test 15/15 failed), `red-ui-scratch.txt` (15/15), `red-final-scratch.txt` (**35 failed / 35**). წავიკითხე; ეს A-ს output-ია. A-ს scratch-ში `node_modules` junction აღარ არის (`ls`).
- **ჩემი mutation-ები:** `store/app` → `c-round-25/mut/app` (`store/`-ის გარეთ); `node_modules` დროებითი junction-ით, ბოლოს `rmdir`-ით მოხსნილი (store-ის `node_modules` ხელუხლებელია, 618 entry). Config მხოლოდ 4 ფაილს უშვებს: master, master-ui, ArrangementContext, graph. ყოველი mutation `mut.py`-ის ზუსტი string replace-ით გაკეთდა (count == 1 assert); run-ის შემდეგ ფაილი store-დან აღვადგინე და byte-შედარებით დავადასტურე (`restored-identical True` ×4).
  - **Control:** 75/75 passed.
  - **(a)** `syncPlayback`-იდან `handle.setMasterGain(...)` წაშლილი → **1 failed**: `applies a master change while playing to the live graph without creating a new one`.
  - **(b)** `setMasterGain`-ში mute-ის τ → `GAIN_TIME_CONSTANT` (ორივე შტო 0.015) → **2 failed**: `setMasterGain uses τ 0.003 …` და `a graph started muted unmutes with the short constant`.
  - **(c)** `sample > MAX_24BIT_SAMPLE` → `>=` → **1 failed**: `does not count a sample exactly at MAX_24BIT_SAMPLE and gives no warning`.
  - **(d)** `scheduleKey`-ში `arrangement.master` → **1 failed**: no-reschedule ტესტი.
- 35 ახალი `it` (17 + 18, ჩემი grep) ≥ 12 ✓.

## 12. C-R23-01 information record (არც PASS, არც FAIL) — გაუარესდა

- `curl -s /studio-lab` ×3: **56 516 B**, თითოეულში **8 NUL** (round 24: 55 611 B, **4 NUL** 26019/26020/42403/42404). ახალი offset-ები, სამივეში ერთნაირი: **3536/3537, 11728/11729, 26924/26925, 43308/43309**.
- NUL-ის კონტექსტი SSR HTML-ში (`runs/c-r23-01-record.txt`):
  - 3536: **header-ის დემო badge** `დემო კოლექცია — ა\0\0ვტორიზ…` — **ახალი, ხილული ტექსტი**;
  - 11728: library-ის ტექსტი `სტემები და არა მიქსიდა\0\0ნ ამოღ…` — **ახალი, ხილული ტექსტი**;
  - 26924: `Arrangement · \0\0მთლიან…` — **ახალი, ხილული ტექსტი**;
  - 43308: music lane-ის `aria-label="მუსიკა — \0\0აქტიურ…"` (= round 24-ის ძველი შემთხვევა).
- **Hydration-ის შემდეგ:** ხილულ text node-ებში NUL/U+FFFD **0**. Badge-ის code point-ები სუფთაა. Hydration error console-ში არ ჩანს. მთელ DOM-ში U+FFFD-იანი ატრიბუტი 1-ია: music-ის `aria-label` (31 char, U+FFFD ×2, `10db 10e3 10e1 10d8 10d9 10d0 20 2014 20 fffd fffd …`) = round 24.
- **Master-ის label-ები (hydration-ის შემდეგ):** `Master` (`4d 61 73 74 65 72`), `Master Mute`, `Master Volume`; readout `0.0 dB`. U+FFFD 0. SSR-შიც სუფთაა.
- **შეფასება:** ეს იგივე SSR stream-ის NUL-ის ბაგია (C-R23-01). header-ის markup-მა byte-ის საზღვრები გადაწია, და დაზიანებული ადგილები 1-დან 4-მდე გაიზარდა. სამი მათგანი ახლა ხილულ ქართულ ტექსტშია hydration-მდე: პირველი paint, no-JS და crawler/SEO. Master-ის კოდი სწორია, ამიტომ ეს ამ round-ის ახალი ბაგი არ არის (task §4.9). **B-სთვის:** ბაგი markup-ის ყოველ ცვლილებაზე ვრცელდება. Tech Lead-ის გადაწყვეტილება (React 19 ან `entry.server.tsx`-ის grant) ახლა უფრო სასწრაფოა; შემდეგ feature round-მდე უნდა დაიგეგმოს.

## 13. Gates

**G25-1** (`gates/g1.sh`, ჩემი გაშვება):
- `npx tsc --noEmit` → exit 0, ცარიელი;
- ახალი 3 ფაილი (master, master-ui, schedule) → **47/47**;
- frozen 4 (render-budget, export-dialog-focus, graph, ArrangementContext) → **66/66**. მათი sha `b-round-24-tree-sha256.txt`-შია → 50 OK, ე.ი. უცვლელია;
- `npx vitest run` → **59 ფაილი, 1045/1045** (= 1010 + 35), exit 0. `sfx-library` flake არ განმეორდა;
- `npx biome check ./app` → exit 0, **218 warning + 1 info**, 0 error (= round 24). Owned 10 ფაილი: `No fixes applied`, exit 0;
- `npm run build` → exit 0 (client და server `✓ built`).

**G25-2** (`gates/g2.sh start|end`, start = end):
- HEAD `c5ed47b`;
- `git status --short` = **54** ხაზი = c24-ის 47 + ზუსტად §3.2-ის 7 ხაზი (`git-status-start-vs-c24.txt`); A-ს `git-status-end.txt`-ის იდენტური;
- `sha256sum -c b-round-24-tree-sha256.txt` → **50 OK**;
- protected **4/4 OK**;
- `Header.tsx` HEAD-ის იდენტურია, `cc1e531`-თან +21/−0;
- forbidden paths-ის status ცარიელია (`entry.server.tsx`, `entry.client.tsx`, `root.tsx`, routes, ui, layout, studio, AuthContext, StudioContext, AudioContext, `types/studio.ts`, `arrangement/index.ts`, public, package, demo data);
- owned sha = A-ს საბოლოო prefix-ები (`d6548d21`, `93be4dcd`, `ee7fafe1`, `2ec43d1a`, `63f1fdf9`, `f67135a8`, `ac2eed7e`, `750c75e6`, `dda9f265`, `1d5bd689`, `1060e617`).

**G25-3** (`$B restart` → ახალი context, credentials-ის გარეშე):
- **პირდაპირი `/studio-lab`** (`anon-direct.json`, `network-anon-direct.txt`, 157 მოთხოვნა): `auth_user` null, cookie ცარიელი; workspace და Master ჯგუფი ჩანს, „Sign in required“ არა. Media მხოლოდ `/middle-east.mp3` და `/videos/hero/hero-music.mp3`. `studio-token`, `recording`, `download`, R2: **0**. Hosts: 127.0.0.1:5173, `localhost:5199/api/cart` (pending, ნებადართული), Google fonts, GTM, GA.
- **Session hook** (`anon-session-hook.json`) fetch/XHR/sendBeacon wrapper-ით. რეალური ქმედებები: search `soft` → `Soft impact` → Enter (clip 1), Master Mute ×2, fader 4 × ArrowDown (`−2.0 dB`), **რეალური export** (`WAV შეიქმნა: 00:02.000…`). Workspace-ის fetch 0, XHR 0, **Authorization 0**. ერთადერთი fetch GA-ს `collect`-ია (`en=scroll`, `gcs=G100`, consent denied; ცნობილი root item).
- **Header-ის `Studio LabDemo` ბმული** (ხილულ ბმულზე რეალური click `/`-დან): `/studio-lab`, auth null, Master ჩანს; media მხოლოდ 2 demo MP3. ერთადერთი შესაბამისი ხაზი ნებადართული dev module `GET /app/lib/r2.config.ts`-ია.
- **`/studio/middle-east`** (`anon-studio-me.json`, screenshot): „Sign in required“, workspace არ არის, Master არ არის, media 0.
- **`curl`:** anonymous → **401** `Please sign in to access Studio.`; fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა (carry).

**Premium auth-ის bypass არ არის.**

**Browser render budget (დამატებით, `runs/render-count-browser.txt`):** `ArrangementMaster`-ის fiber-ის type wrapper-ით (round 11-ის `rcount.js`-ის მეთოდი): Play-ის დაწყებისას 450 ms-ში 1 render (`isPlaying`), შემდეგ **121 frame / 2 წმ დაკვრა → 0 render**. Wrapper მუშაობს: Mute click-ზე 2 render.

## 14. ახალი ბაგები

**ამ round-ის scope-ში არცერთი.**

დაკვირვებები (ბაგი არ არის; B-სთვის):
1. **C-R23-01 გაუარესდა** (§12): 8 NUL, 3 ახალი ხილულ SSR ტექსტში. ბაგი ღიაა, medium; Tech Lead-ის გადაწყვეტილება უფრო სასწრაფოა.
2. **Export bit-deterministic არ არის** (±1 LSB, §5.1). ეს ცნობილია round 11-დან. Byte-იდენტურობის oracle ამ pipeline-ზე ვერ შესრულდება; შემდეგ რაუნდებში oracle-ად სტატისტიკა (FS/RMS/frames) ან max |Δ| ≤ 1 LSB უნდა გამოვიყენოთ.
3. Mute + gain ≠ 0: dialog ორივე note-ს აჩვენებს (§5.4, low UX).
4. Fader-ის 4 px pointer target (§9), track fader-ის იგივე pattern. Stage 4-ის fader UX.

## 15. Carried (ღია, არ დახურულა)

**ღია C ბაგები:**
- **C-R23-01** (medium, SSR NUL; ახლა 8 NUL, ხილულ SSR ტექსტშიც; Tech Lead: React 19 ან `entry.server.tsx`-ის ვიწრო grant);
- C-R6-02 და C-R8-01 (Tech Lead, quiet Chrome).

**Root (`root-pre-push-review.md` 10-07, `publication-checkpoint.json` 10-09; round 24-ის შემდეგ არ შეცვლილა):**
- purchased loader-ში middle-east hardcode-ია (SRW-21);
- Lenis `/studio/*`-ზე;
- portable instruction-file paths;
- export hard-clip 0 dBFS-ზე: **ახლა ხილულია** (R25-EO alert, 1800 sample), Master მომხმარებლის საშუალებაა (−5.0 dB → FS 0). Clamp რჩება, limiter არ არის;
- საბოლოო commit/push მხოლოდ ყველაფრის შემდეგ, uncommitted round-6..25 tree (ახლა 54 ხაზი);
- shared `Modal.tsx`-ის focus gap;
- root GA `scroll`/`page_view` consent-denied-ით (ამ round-შიც `en=scroll` `gcs=G100`);
- ორი foreign agent ფაილი (არ შემხებია);
- A round-17 deviation 4, A round-19 deviation 5, A round-22 deviation 4, C-ის python probe-ები rounds 21–22-ში;
- fake Bearer → 500 token-ის გარეშე;
- CDP allowlist `Input.dispatchMouseEvent`-ს უარყოფს (ამიტომ seek და drag synthetic-ია);
- publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, final commit/push);
- `entry.server.tsx`-ის `Content-Type: text/html` charset-ის გარეშე (დაკვირვება, იგივე Tech Lead-ის კითხვა).

**სხვა scheduled:** SRW-13 ეტაპი 2 (meter-ები, peak hold, latch-იანი clip indicator), 3 (FB-04 clip gain), 4 (FB-05 pan, fader UX, round-9 M1/L8); LIB-SEP-REASON; lane overlay `/60`; footer-ის ლათინური ტექსტი; group hint-ის `range`; folded clips a11y-ში; SRW-14..20 → SRW-21 → სრული regression → T12.

**Tech Lead manual:** R23-1/2, R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, R22-T, Lenis `/studio/*`, MP4/MOV-ის დადებითი import, და ახალი **R25-T** (რეალური მაუსით Master fader-ის drag; Master Mute/unmute-ის მოსმენა ყურსასმენებით).

## 16. B-სთვის

- Round 25-ის scope დახურულია C-ის მტკიცებულებით. `feature-status.md`-ში FB-14 / SRW-13 ეტაპი 1 შეიძლება მოინიშნოს „მზადაა“. FB-14 მთლიანად **არ** არის მზად: ეტაპი 2 (ცოცხალი meter + clip indicator) დარჩენილია.
- C-R23-01 გაუარესდა (§12). შემდეგ feature round-მდე Tech Lead-ის პასუხი სჭირდება.
- შემდეგი round-ის oracle-ებში export-ის byte-იდენტურობა ±1 LSB-ის ტოლერანსით ჩაანაცვლე (§14.2).

## 17. ფაილები

- `c-round-25/{b,r,setup,p2a,mv,mm,vm,solo,rv22,exp,ur}.sh`, `mut.py`, `gates/{g1,g2}.sh`, `checkpoint.md`;
- `scripts/{geo,ae,ks,keys,k2,drag,loop812,mv-start,mv-an,seam,mm-an,ur-an,vm-start,vm-an,wav25,wdiff,ratio,hook,nulscan,mrc}.js` და წინა round-ების helper-ები (`c-round-2/setup-base.js`, `c-round-22/sp22.js`/`rv22.js`, `c-round-11/lay11.js`, `c-round-24/h.js`/`p2a.js`, `c-round-13/fv.js`, `c-round-23/drops.js`);
- `runs/*`, `gates/*`, `shots/{header-1440,header-1280,header-1280-minus60,fv-1440,export-*,anon-studio-middle-east}.png`;
- `mut/` (scratch copy; junction მოხსნილია).
- `runs/mv-1-seam.txt`: pass-ების sample-ების შედარების ცდა. ის bit-იდენტური არ გამოვიდა (sub-sample start, resampling), ამიტომ oracle-ად არ გამომიყენებია. მხოლოდ ინფორმაციისთვის.
