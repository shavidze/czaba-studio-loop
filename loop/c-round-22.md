# C — Round 22 შემოწმება: C-R21-01 — სწრაფი de-click mute (D-29m)

შემმოწმებელი: C (Claude Opus 5.5) · თარიღი: 2026-10-11 · დავალება: `current-task.md` (round 22) · A-ს ანგარიში: `a-round-22.md`
Browser: gstack browse, state `c-browse.json`, სერვერი `http://127.0.0.1:5173` (არ გამიშვია და არ გამიჩერებია). Source-ში ცვლილება 0, commit 0. ყველა ფაილი `c-round-22/`-შია (`runs/`, `shots/`, `gates/`, `scripts/`, `mut/`, `checkpoint.md`). Harness-ის წესები მონაცემების ნახვამდე ჩავწერე `c-round-22/checkpoint.md`-ში.

## 0. ვერდიქტი — **PASS** (ახალი ბაგი არ არის; C-R21-01 დახურულია)

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R22-M1 (C-R21-01, შესწორებული R3-V2 mute oracle) | **PASS**: 2 ვალიდური run (repro + full), 1 ჩანაცვლება | `runs/rv22-M1_repro2.txt`, `rv22-M1_full1.txt` |
| R22-M2 (ramp და არა hard cut) | **PASS**: 1 ვალიდური run | `runs/rv22-M2_1.txt` |
| R22-M3 | **not run**: §0-ში ჩამოთვლილია, მაგრამ §4-ში განსაზღვრული არ არის (B-ს ტექსტის ხარვეზი, §5) | — |
| R22-V (R3-V2-ის დანარჩენი ნაწილი) | **PASS** | `rv22-M1_repro2.txt`, `rv22-M1_full1.txt` (+ M2_1, A3_2) |
| R22-A1 (volume smoothing) | **PASS** | `runs/a1-volume.txt` |
| R22-A2 (music M/S) | **PASS** | `runs/a2-music-ms.txt` |
| R22-A3 (Play muted ხაზით) | **PASS**: 1 ვალიდური, 1 ჩანაცვლება (harness) | `runs/rv22-A3_2.txt` |
| R22-S | **PASS** | `git diff` (§1.3) |
| R22-U | **PASS** (ჩემი mutation scratch copy-ში, `store/`-ის გარეთ) | `runs/r22u-mutation-0015.txt`, `r22u-control-0003.txt` |
| R22-Doc | **PASS** | doc 028 |
| G22-1 | **PASS** | `gates/tsc.txt`, `vitest-graph.txt`, `vitest-all.txt`, `biome-app.txt`, `build.txt` |
| G22-2 | **PASS** (დასაწყისი და ბოლო) | `gates/*-start.txt`, `*-end.txt` |
| G22-3 | **PASS**: premium auth bypass არ არის | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| Real export sanity | **გაიარა** (hard-clip: ცნობილი R13-M4) | `runs/export-sanity.txt`, `shots/export-dialog-1440.png` |
| R22-T (click ყურით) | **Tech Lead**, ჩემთვის დაბლოკილია (headless-ში მოსმენა შეუძლებელია) | — |

ყველა რიცხვი ჩემი გაზომვაა. A-ს ციფრები მხოლოდ შედარებისთვის გამოვიყენე.

## 1. Gates, R22-S, R22-U

### 1.1 G22-1 (`gates/g1.sh`; ბრაუზერის run-ებამდე გაეშვა, პარალელურად არა)
- `tsc --noEmit`: exit 0, output ცარიელი.
- `vitest run graph.test.ts`: **19/19**.
- `vitest run`: **57 ფაილი, 1005/1005**, exit 0. 999 + **6 ახალი `it`** (≥ 5 ✓). `sfx-library` flake არ განმეორდა.
- `biome check ./app` (read-only): 323 ფაილი, „No fixes applied“, 218 warning + 1 info, **0 error**.
- `npm run build`: exit 0.

### 1.2 G22-2 (`gates/g2.sh start|end`)
- HEAD `c5ed47b`.
- `git status --short`: **45 ხაზი**. 3 owned ხაზის გამოკლებით, დასაწყისშიც და ბოლოსაც **იდენტურია** `c-round-21/gates/git-status-end.txt`-ის (`diff exit 0`). დამატებულია ზუსტად `M graph.test.ts`, `M graph.client.ts` და `?? 028-studio-lab-mute-declick.md`. დასაწყისისა და ბოლოს status იდენტურია.
- `sha256sum -c b-round-21-tree-sha256.txt`: **49 OK** (დასაწყისი და ბოლო).
- Protected: 4/4 OK. `Header.tsx`: HEAD-თან diff ცარიელია, `cc1e531`-თან +21/−0.
- აკრძალული გზები (`app/styles`, `root.tsx`, `routes/`, `animations`, `ui`, `layout`, `public`, `package*.json`, `studio-lab-demo.ts`): 0 ხაზი.
- 3 owned ფაილის sha დასაწყისში და ბოლოს ერთნაირია (`owned-sha-*.txt`), ე.ი. ჩემი შემოწმების დროს არაფერი შეცვლილა.
- Dev server-ის module-ში A-ს mutation-ის კვალი არ არის: `curl /app/lib/arrangement/graph.client.ts` → `MUTE_TIME_CONSTANT = 3e-3`, `GAIN_TIME_CONSTANT = 0.015`.

### 1.3 R22-S
`git diff -- graph.client.ts` (+12/−1) მხოლოდ ამას ეხება:
- l.8 `const MUTE_TIME_CONSTANT = 0.003;` (export-ის გარეშე);
- `lastGainTargets` Map-ის გამოცხადება;
- construction-ის seed (`initialGain`, გამოსახულება იგივეა, `gain.value`-ში და Map-ში იწერება);
- `setTrackGain`-ის ტანი.

`renderArrangementWav`, `appendPlan`, `stop`, `disconnect`, export-ები და `ScheduleHandle` უცვლელია. `setValueAtTime`/`cancelScheduledValues`/`linearRampToValueAtTime` არ არის.

### 1.4 R22-U
- `graph.test.ts` შეიცავს §2.3-ის ყველა შემთხვევას (mute/unmute 0.003; muted seed; audible seed 0.015; solo seed; per-track; same-target re-send 0.8→0.8 / 0→0 და უცნობი id; 1 `start` და 0 `stop`; static `not.toContain('setTrackGain')`). მწვანეა (19/19).
- A-ს red-first (`a-round-22/red.txt`): **5 failed** — mute/unmute, muted seed, solo seed, per-track, re-send. სწორედ mute/unmute/seed ტიპის შემთხვევებია.
- **ჩემი mutation:** `graph.client.ts` და `graph.test.ts` დავაკოპირე `c-round-22/mut/`-ში, რაც `store/`-ის გარეთაა. Relative import-ები store-ის აბსოლუტურ გზებზე გადავწერე, `MUTE_TIME_CONSTANT = 0.015`. გავუშვი store-ის vitest binary-ით და საკუთარი config-ით (`mut/vitest.config.mts`).
  - შედეგი: **5 failed / 14 passed**. ჩავარდა mute/unmute, ორივე 0-seed, per-track და re-send.
  - Control (იგივე copy, 0.003): **19/19**.
  - store-ის ფაილი ხელუხლებელია (sha `db337424…`).

## 2. ბრაუზერის run-ები (1440×900)

**Harness.** ყველა mixer toggle რეალური `$B click`-ია ელემენტის ცენტრზე. Volume-ისთვის გამოვიყენე რეალური click და რეალური `$B press`.
- Layout: `beeps-6s-vp9-opus.webm` file drop-ით (synthetic DragEvent, round 21-ის `dropFiles`) → video 0–6.008. `სრული მიქსი` library drag-ით music-ზე 7-დან (round 21-ის `place`). Clip table: `[["music",7,16,0],["video",0,6.008,0]]`. ყველა track: volume 1, mute/solo false.
- Beep-ები: k..k+0.1 წმ, k = 0..5. ფანჯრები: [k+0.005, k+0.095].
- Mapping: demo-ში ყველა track-ის volume **1** (task-ის 0.8 მაგალითია). შეფასების ტიპი და ყველა დონე უცვლელია.

**Instrument** (`scripts/sp22.js`, read-only, source-ის instrumentation არ არის):
- `AudioParam.prototype.setTargetAtTime`-ის spy, რომელიც იწერს `(target, startTime, timeConstant)`-ს, live პოზიციას და წინა target-ს. წინა target ინახება **param-ზე** (WeakMap) და seed-დება `gain.value`-დან label-ის მინიჭებისას.
- Label-ი connect graph-იდან მოდის: source.buffer.duration → clipGain → trackGain.gain (6.0 = video, 16 = music). Stems/SFX-ს source არ ჰქონდა, ამიტომ label `null`-ია.
- Master tap: round 2-ის 128-frame RMS tap, პლუს ახალი raw-sample worklet master→destination-ზე (2 ms block-ებისთვის).
- `pos = startTime − startAt`, Play 0-დან. Sample rate 48 kHz.
- Beep-ის ტონი: **1000 Hz** (zero-crossing decode, beep 0). დონე **−9.0 dBFS** RMS. 2 ms block = 2 სრული პერიოდი.

**W = 35 ms.** Pre-mute დონე −9.07 dBFS, ამიტომ ფორმულით W მხოლოდ შემცირდებოდა. 35 დავტოვე. „While muted“ ასე წავიკითხე: ფანჯარა იწყება ≥ t_m + W-ზე **და** მთავრდება t_u-მდე (task-ში ეს განსაზღვრული არ არის).

### 2.1 R22-M1 (ბიუჯეტი: 2 ვალიდური + ≤ 2 ჩანაცვლება)

| Run | სტატუსი | t_m (τ) | lead შემდეგ beep-მდე | ფანჯრები ≥ t_m+W, muted | t_u (τ) |
|---|---|---|---|---|---|
| CAL | კალიბრაცია, **არ ითვლება** (წინასწარ ასე განისაზღვრა). raw tap ჯერ არ იყო მზად | 0.8407 (.003) | — | beep 1, 2: −240 | 2.8193 (.003) |
| repro1 | **არავალიდური**: click latency, lead **100.7 ms** > 100 | 0.8993 (.003) | 100.7 ms | beep 1, 2: −240 | 2.8993 (.003) |
| **repro2** | **ვალიდური, PASS** | **0.9393 (.003)** | **60.7 ms** | **beep 1: −240 / −240 (tap/raw)**, beep 2: −240 | 2.8913 (.003) |
| **full1** | **ვალიდური, PASS** | **0.6407 (.003)** | 359.3 ms | beep 1, 2: **−240** | **2.9020 (.003)** |

- **C-R21-01-ის check:** mute beep-ამდე 60.7 ms-ით ადრე → beep 1 **−240 dBFS** (ციფრული ნული). Round 21-ში 40 ms-ზე იყო −52.3, 98 ms-ზე −86.3.
- [t_m, t_m+W)-ში არცერთი ფანჯარა არ დაიწყო (info: ცარიელი).
- Spy ორივე run-ში აჩვენებს: mute = video `1 → 0`, **τ 0.003**; იმავე `syncPlayback`-ში music `1 → 1` τ 0.015 და stems/SFX `1 → 1` τ 0.015.

### 2.2 R22-M2 (`rv22-M2_1.txt`, 1 ვალიდური)
- t_m = 1.0487, beep 1-ის onset-იდან **48.7 ms**-ში. Task „დაახლოებით 20 ms“-ს ითხოვდა. ჩემი წინასწარი ვალიდურობის ზღვარი (8–65 ms) დაცულია, t_m + 35 = 83.7 ms ისევ beep-ის შიგნითაა. ეს გადახრა ღიად ვაცხადებ.
- L0 = **−9.07 dBFS** (10 ms t_m-მდე).
- 2 ms block-ები t_m-დან: 0: −11.4, 2: −17.1, 4: −22.9, 6: −28.7, 8: −34.5 … 22: −75.0, 24: −80.8, 26: −86.6, 30: −98.2, 32+: −240. დახრა 5.8 dB / 2 ms = **2.9 dB/ms**, ზუსტად τ = 3 ms-ის ექსპონენტა.
- ≥ 1 dB-ით დაცემის პირველი block: **0 ms**. ე.ი. scheduling lag გაზომვადი არ არის, ramp t_m-ის მომდევნო quantum-ში იწყება.
- **Ramp არსებობს:** −3 dB block 2 ms, −23 dB block 8 ms → **6 ms ≥ 3 ✓**. Hard cut ორივეს ერთ ან მეზობელ block-ში ჩასვამდა.
- **სწრაფად ჩუმდება:** ≥ 35 ms-ის block-ები beep-ის შიგნით (36…48 ms, 7 block) = **−240 < −80 ✓**. < −80 უკვე 24 ms-ზე მიიღწევა.
- Beep 1-ის მთლიანი ფანჯარა −12.2 (mute შუაშია, მხოლოდ info). Beep 2 (muted): −240.

### 2.3 R22-V
ყველა ვალიდურ run-ში (repro2, full1, M2_1, A3_2):
- `video.paused === false` (active) მთელ clip-ში. `muted === true` ორივე `<video>`-ზე ყოველ frame-ზე. `<video>` ყოველთვის 2.
- Source counter-ები: Play-ზე 2 start, toggle-ების დროს **+0 start / +0 stop**.
- **Unmute ≤ 100 ms (spy-anchored):** პირველი ფანჯარა ≥ t_u + 100 ms (beep 3: repro2, full1, M2_1) = **−9.0**, ე.ი. unmuted დონესთან 0 dB სხვაობა ✓.
- Click-anchored latency, round 21-ის მეთოდით (aria-pressed → პირველი block > −40 dBFS): **98.7 / 88.0 / 88.0 / 77.3 ms**. Round 21-ში 88 იყო.
- **Solo music დაკვრის დროს** (full1, რეალური click 3.62-ზე): video `1 → 0` **τ 0.003** t_s = 3.6007-ზე, stems/SFX `1 → 0` τ 0.003, music `1 → 1` τ 0.015. Beep 4, 5 (≥ t_s + W) = **−240** ✓. Video არ გაჩერებულა.
  - Solo ცოცხლად დავაჭირე, რადგან round 21-ის Play-მდე solo-ს target-0 გამოძახება არ ექნებოდა (gain 0-ით იქმნება).
  - Unsolo run-ის შემდეგ.
- Dock counter-ები: **0 → 0** (swaps/fallbacks/hardSeeks/escalations) ყველა run-ში.

### 2.4 R22-A1 (`runs/a1-volume.txt`)
- Play 6.8-დან (music 7-დან ჟღერს). რეალური click `Volume — მუსიკა`-ს ცენტრზე → 0.5 (native range: click წერტილზე სვამს მნიშვნელობას). Focus slider-ზეა.
- რეალური `ArrowDown` ×3 და `ArrowUp` ×4 → 0.51.
- Spy: **64 გამოძახება, ყველა არანულოვანი → არანულოვანი, ყველა τ 0.015** (music: 1→0.5, 0.5→0.49 … 0.5→0.51; თითო press-ზე 2 გამოძახება). From/to-0 გამოძახება: 0.
- Source-ები: 1 start (Play) / 1 stop (Pause), restart არ ყოფილა. History: `Volume`.

### 2.5 R22-A2 (`runs/a2-music-ms.txt`)
- Play 6.8-დან. რეალური click-ები: Mute — მუსიკა ×2, Solo — მუსიკა ×2.
- Spy: music `0.51 → 0` **.003**, `0 → 0.51` **.003**. Solo-ზე სხვა ხაზები `1 → 0` .003 და unsolo-ზე `0 → 1` .003. Music-ის re-send `0.51 → 0.51` .015. Zero-class 8/8 = .003, non-zero 8/8 = .015.
- Source-ები: 1 start / 1 stop (Play/Pause), restart არ ყოფილა.
- History: თითო toggle-ზე ერთი ჩანაწერი. Undo chain რეალური Ctrl+Z-ით: `Solo — მუსიკა` (solo false) → `Solo — მუსიკა` (true) → `Mute — მუსიკა` (false) → `Mute — მუსიკა` (true) → `Volume`. Ctrl+Shift+Z-ით ბოლომდე აღვადგინე. ეს round 21-ის ქცევაა (mixer ჩანაწერები).

### 2.6 R22-A3 (`runs/rv22-A3_2.txt`)
- Video ხაზი Play-მდე muted-ია (რეალური click). Play-ზე video-ზე **target-0 გამოძახება არ არის** (gain 0-ით შეიქმნა). Beep 0, 1, 2 = **−240** პირველივე beep-იდან ✓.
- Unmute (რეალური click): video `0 → 1` **τ 0.003** (spy-ის seed 0 = construction value). Beep 3, 4, 5 = −9.0. Click-anchored latency 77.3 ms.
- ჩემს summary-ში `within1dB: false` harness-ის artifact-ია: reference beep 0-ზე იყო აღებული, რომელიც აქ muted-ია. −9.0 reference-თან (სხვა run-ები) სხვაობა 0 dB-ია.
- A3_1 **არავალიდურია**: ჩემი harness-ის შეცდომა (`beepHz` null muted beep 0-ზე), ჩანაცვლებულია.

### 2.7 Real export sanity (`runs/export-sanity.txt`)
- პირველი ცდა ცარიელ arrangement-ზე იყო (demo ცარიელით იტვირთება). Dialog-მა სწორად აჩვენა `ექსპორტი გამორთულია: პროექტი ცარიელია…`. ეს ჩემი layout-ის გამოტოვება იყო, ამიტომ ცდა არავალიდურია (`…INVALID-empty-arrangement…`).
- Layout = `lay11` (rounds 16–20): video 0–6.008, music 0–16, stems 2–18, SFX 4–6. რეალური `$B click` `Export`-ზე, `WAV-ის ექსპორტი`-ზე და `დახურვა`-ზე.
- Dialog: `მთელი პროექტი · 0:00 — 00:18.000`. Status: `WAV შეიქმნა: 00:18.000, 24-bit · 48 kHz · stereo.`
- WAV: RIFF/WAVE PCM, 2 ch, 48 kHz, 24-bit, **864 000 frame = 18.000 წმ** = projectEnd ✓.
- **NaN 0.** Full-scale **1800 sample**, peak 1.0 (round 20-ის ტოლი; ცნობილი R13-M4). ბოლო არანულოვანი sample 17.99998 წმ-ზე. Dialog დაიხურა.
- **Info (არა criterion):** video ხაზის mute export-შიც მოქმედებს. Unmuted − muted export-ის სხვაობა beep-ის ფანჯრებში = **−9.04 dB** (ზუსტად beep), gap-ში −87.8, 7–18 წმ-ზე −240 (`runs/export-muted-video-info.txt`).

### 2.8 G22-3 (`$B restart` → ახალი context, credentials-ის გარეშე, harness არ ჩამიტვირთავს)
- **პირდაპირი `/studio-lab`** (`anon-direct.json`, 156 მოთხოვნა):
  - `auth_user` null, cookie ცარიელი, localStorage-ში მხოლოდ `czaba_session_id`;
  - workspace ჩაიტვირთა, „Sign in required“ არ ჩანს;
  - Media: მხოლოდ `/middle-east.mp3` და `/videos/hero/hero-music.mp3`;
  - `studio-token`, `recording`, `download`, R2 host: **0**;
  - API მხოლოდ root `GET localhost:5199/api/cart` (pending, ნებადართული);
  - GA `collect` `gcs=G100`-ით (consent denied, ნებადართული carry).
- **სესიაში fetch/XHR hook** (`anon-session-hook.json`): რეალური click search-ზე, `$B type soft`, რეალური click `Soft impact` option-ზე, რეალური Enter → clip 0 → 1. fetch 0, XHR 0, `Authorization` 0. Network: 0 მოთხოვნა.
- **Header-ის `Studio LabDemo` ბმულზე რეალური click** `/`-დან (`anon-header.json`, 43 მოთხოვნა): `/studio-lab`, auth null. აკრძალული 0. Media მხოლოდ 2 demo MP3 + GA consent denied.
- **`/studio/middle-east`** → „Sign in required“, workspace არა, media 0 (`shots/anon-studio-middle-east.png`).
- **`curl`**: anonymous → **401** `Please sign in to access Studio.`; fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა (carry).

### 2.9 Viewport-ები
1280×720 არ გამიშვია: round-ის ცვლილება მხოლოდ audio graph-ის τ-ს ეხება (layout/UI ფაილი არ შეცვლილა, G22-2), ხოლო task 1440×900-ს ითხოვს.

## 3. ბაგები B-სთვის
**ახალი ბაგი არ არის.** C-R21-01 დახურულია R22-M1/M2-ით. `c-round-22.json`-ის `blocked`-ში მხოლოდ R22-T და R22-M3 წერია; carried და ხელახლა გაუშვებელი ID-ები მხოლოდ ამ ანგარიშშია (§7).

## 4. არავალიდური გაზომვები (მიზეზით)

| ფაილი | მიზეზი |
|---|---|
| `runs/rv22-CAL.calibration-not-counted.txt` | წინასწარ განსაზღვრული კალიბრაცია (LAT 0.44 → 0.36). raw tap ჯერ არ იყო მზად |
| `runs/rv22-M1_repro1.INVALID-lead-100.7ms-click-latency.txt` | click latency: lead 100.7 ms, საჭიროა 40–100 (beep მაინც −240 იყო) |
| `runs/rv22-A3_1.INVALID-harness-beepHz-null.txt` | ჩემი harness (`toFixed` null-ზე) |
| `runs/export-sanity.INVALID-empty-arrangement-no-layout.txt` | ჩემი setup: layout არ ავაწყვე |

ჩავარდნა retry-ით PASS-ად არ ქცეულა. ყველა არავალიდურ ცდაში იზომებოდა ერთი და იგივე ქცევა და არცერთი არ იყო ჩავარდნა.

## 5. დაკვირვებები B-სთვის (არა ბაგი)
- **R22-M3** §0-ში და doc 028-ის TODO-ში ჩამოთვლილია, მაგრამ §4-ში განსაზღვრული არ არის. Not run. თუ B-ს რამე ჰქონდა ჩაფიქრებული, შემდეგ round-ში განსაზღვროს.
- **R22-M2 timing:** mute onset-იდან 48.7 ms-ში დაჯდა (task: ~20 ms). Oracle-ის პირობები (L0 beep-ში, t_m+35 beep-ში) დაცულია.
- **ციფრული ნული:** ~32 ms-ის შემდეგ master ზუსტად 0-ია (−240), თუმცა τ = 3 ms-ის ექსპონენტა იქ ~−100 dBFS-ს იძლეოდა. ეს ბრაუზერის AudioParam-ის `setTargetAtTime`-ის exact-target snap-ია (ზღვართან მიახლოებისას ზუსტად target-ზე ჯდება), არა გაზომვის floor და არა denormal flush. უარყოფითი არ არის.
- **Unmute click-anchored latency** 77–99 ms-ია, ძირითადად click → React → `syncPlayback`-ის გზაა. Gain-ის ramp თვითონ ~10 ms-ში აღწევს −1 dB-ს. ეს 100 ms-ის ზღვართან ახლოსაა, მაგრამ criterion spy-anchored-ია და ის გავიდა.
- **Demo ცარიელი arrangement-ით იტვირთება.** Export-ის 864 000-იანი reference `lay11` layout-ს ეხება, task-ის „unchanged demo“ კი არა. B-მ ტექსტში ეს დააზუსტოს.
- **Volume slider-ზე click** მნიშვნელობას click-ის წერტილზე სვამს (1 → 0.5). ეს native range-ის ქცევაა. Ableton-ის fader-ზე click ხტომას არ იწვევს, ამიტომ UX-ის თემაა SRW-13-ისთვის, ბაგი არა.

## 6. Product flow (find → add → fit video → export) და Ableton-თან შედარება
- **Find + add:** library search `soft` → option → Enter (anon). Library drag music ხაზზე. ვიდეო file drop-ით.
- **Fit video / mute ორიგინალი ხმა (FB-16):** mute ახლა Ableton-ის Track Activator-ს ემთხვევა: ექსპონენციალური de-click (2.9 dB/ms, 6 ms −3-დან −23 dB-მდე), < −80 dBFS 24 ms-ში, ციფრული ნული ~32 ms-ში. Video არ ჩერდება, source-ები არ იწყება თავიდან. Volume fader-ი 15 ms smoothing-ს ინარჩუნებს (zipper არა).
- **Export:** dialog-ით WAV 18.000 წმ, NaN 0. Video ხაზის mute export-შიც მოქმედებს (info). Hard-clip (R13-M4) ჯერ ღიაა, SRW-13.

## 7. Carried (უცვლელი; არა PASS, არა ახალი ბაგი)
Root (`root-pre-push-review.md`, `publication-checkpoint.json`; ორივე ფაილი 10-07/10-09-ის შემდეგ უცვლელია):
- purchased loader middle-east-ზე hardcoded (SRW-21);
- Lenis `/studio/*`-ზე;
- portable instruction-file paths;
- export hard-clip 0 dBFS (R13-M4, SRW-13; ამ round-ში 1800 full-scale sample);
- საბოლოო commit/push მხოლოდ ბოლოს; uncommitted round-6..22 tree;
- საერთო `Modal.tsx` focus gap;
- root GA `scroll`/`page_view` consent denied-ით (G22-3-ში ჩანს `gcs=G100`);
- ორი უცხო agent ფაილი (არ წამიკითხავს, არ შემხებია);
- A round-17 dev. 4, A round-19 dev. 5 და C round-21-ის python probe;
- fake Bearer → 500 token-ის გარეშე;
- CDP allowlist `Input.dispatchMouseEvent`-ს კრძალავს;
- publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, საბოლოო commit/push).

Root M1, M2, M3, L1–L4, L6, L7, L8 დახურულია.

Tech Lead-ის ხელით: R23-1/2, R12-L4, RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, Lenis `/studio/*`, MP4/MOV-ის დადებითი import, **R22-T** (mute/unmute click ყურსასმენებით).

ღია C ბაგები: C-R6-02, C-R8-01 (Tech Lead quiet Chrome). **C-R21-01 დახურულია.**

ამ round-ში ხელახლა არ გაშვებულა (task §4.6, არა PASS round 22-ისთვის): RF5-3, R3-V1, R3-V4, R5-L3, R11-P3 sync. მათი ბოლო მტკიცებულება round 21-შია.

## 8. Deviations და გარემო
- **Python:** spy-ის patch-ისთვის შემთხვევით `python -` გავუშვი (anaconda). Round 21-ის მსგავსად გაიჭედა და ჩემი პროცესი (pid 1371/1370) თავად გავთიშე. Patch node-ით გავაკეთე. ბოლოს python/vitest პროცესი არ დარჩენილა.
- `$B restart` G22-3-ისთვის (ახალი daemon, pid 47896).
- Browser-ის side effects მხოლოდ demo local state-ია: layout, mixer, music volume 0.51 (ძველ context-ში, restart-მდე). Mixer toggle-ები ბოლოს აღვადგინე.
- Dev server-ს არ შევხებივარ. Source-ში ცვლილება 0 (G22-2 ბოლოს, owned sha იგივეა).
- Scripts: `c-round-22/{b,r,rv22,show}.sh`, `gates/{g1,g2}.sh`, `scripts/{sp22,rv22}.js` + round 2–21-ის helper-ები (`c-round-21/setup.sh`, `c-round-11/scripts/lay11.js`).

## 9. შემდეგი (B)
- Round 23: task §7-ის მიხედვით (A round-11 follow-ups, ნაწილი 1, `ArrangementLane.tsx`).
- ტექსტის გასწორებები: R22-M3-ის განსაზღვრა ან ამოღება; export-ის reference-ში „unchanged demo“ → `lay11`; round 21-ის R11-P1c-ისა და R2-V1 MOV-ის ტექსტები (თუ ჯერ არ გასწორებულა).
- `feature-status.md`: C-R21-01 / R3-V2 → **მზადაა** (round 22-ის მტკიცებულებით).
