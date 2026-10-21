# C — Round 6 დამოუკიდებელი ვერიფიკაცია

თარიღი: 2026-10-09 · Verifier: C · ობიექტი: A round 6 (`a-round-6.md`), დავალება `current-task.md` (round 6)
სესიები: C სესია 1 (13:35–14:26, context-restart-მდე) + C სესია 2 (ეს სესია, 14:28-დან). სესია 2-მა წინა სესიის artifact-ები გადაამოწმა, ღია ID-ები თავიდან გაუშვა, ახალი run-ები დაამატა.

## 0. ვერდიქტი

**taskStatus: FAIL.**

- **RF6-2 FAIL** (drift regression, C-R6-02, Medium). 30 R3-V1 run-იდან 6 FAIL-ია, 2 INVALID. ამათგან 8 run-ს აქვს app-attributed LoAF ≥ 10 ms; round 5-ში ასეთი 0 იყო. RF5-3: 9 run-იდან 4 სუფთა PASS-ია.
- **R10-N5 FAIL** (Low, C-R6-03). Fit-ის შემდეგ ბოლო ruler label 19.2 px-ით სცდება timeline tail-ს და horizontal scroll-ს ზრდის.
- Track S-ის დანარჩენი ID-ები და Track U-ს დანარჩენი ID-ები PASS-ია, აქედან RF6-1 შენიშვნით (§2).
- G6-1, G6-2 და G6-3 PASS-ია. **Premium auth bypass არ არის.**
- G6-R ნაწილობრივ შემოწმდა. ჩამონათვალი §5-შია: თავიდან გაშვებული ID-ები ცალკეა, გაუშვებელი ID-ები ცალკე. გაუშვებელი ID PASS-ად **არ** ითვლება.

## 1. Tree, gates (G6-1, G6-2)

- HEAD `c5ed47b`. მასზე ზემოდან 11 M ფაილია, 443+/59−. ყველა path დაშვებულია §2.1/§2.2-ით. შეცვლილი ფაილების mtime ≤ 13:27; C სესია 1 13:35-ზე დაიწყო, ე.ი. ვერიფიკაციის დროს წყარო **არ შეცვლილა**. სიები: `c-round-6/git-status-start.txt`, `diffstat-start.txt`, `diffstat-vs-354e341.txt`.
- სესია 2-ის ხელახალი run:
  - `npx tsc --noEmit` → exit 0 (`tsc-recheck.txt`);
  - `npx vitest run` → **49 files / 761 passed** (`vitest-recheck.txt`).
- სესია 1-ის run-ები:
  - vitest arrangement 17/297;
  - biome owned: 49 files, 0;
  - `./app`: 0 errors / 218 warnings;
  - `npm run build` OK (`build.txt`).
- Protected hashes 4/4 OK.
- `Header.tsx`: `git diff HEAD` ცარიელია, `cc1e531`-თან +21/−0.
- `app/styles`, `root.tsx`, `routes/`, `public`, `package.json` არ შეცვლილა.

## 2. Track S

| ID | შედეგი | Evidence |
|---|---|---|
| R26-1 | **PASS.** (a) cross-lane, (b) same-lane, (c) Mute: მეორე pointer-მა არაფერი შეცვალა (impact 8, `aria-pressed=false`). (c)-ში ჩანს `GESTURE_EDIT_BLOCKED_MESSAGE`. Ghost და Shift hint pointer 7-ის release-მდე რჩება. ერთი entry, `isPointerGestureActive()` false. Ctrl+Z, Undo და Delete შემდეგ მუშაობს. დამატებით: second-pointer click, lane bg, ruler — side effect არ არის | `runs/r26-{a,b,c,click2,lane2,ruler2,play}.json` |
| R26-2 | **PASS.** Volume snap-back → 1. Solo, ＋, Enter, dblclick, synthetic drop, Split და Undo ღილაკი refused; clip არ დამატებულა. Drag-ის დროს Play მუშაობს, drag გრძელდება | `runs/r26-2.json` |
| R26-3 | **PASS.** Stale clip და stale brace (pointer 7, `buttons:1`) revert-დება და entry არ იწერება. ახალი clip drag ერთ entry-ს წერს, count 0 | `runs/r26-3.json` |
| R26-U | **PASS.** `gesture-guard.test.tsx` 11/11. A-ს pre-fix log `%TEMP%/a6-guard-before.txt` C-მ წაიკითხა: 7/7 ×. Assertion-ებია `expected 9 to be 8`, brace `{14,16}` ≠ `{12,14}` და `aria-pressed 'true'` ≠ `'false'`. git stash აკრძალულია, ამიტომ C-მ old code თავად არ გაუშვა | vitest |
| RF6-1 | **PASS შენიშვნით.** Fixture: საკუთარი 20 წმ `c-round-6/media/long-20s-vp9-opus.webm` (sha `media/SHA256SUMS.txt`). 22 forced run (16 fresh-release + 6 arbitrary). თითო run-ში 6–8 escalation. Escalation `seeked`-დან ≥ 790 ms-ზე. Counted max 352 ms ≤ 450. Seeking-ის დროს 0 write; hard seek-ებს შორის მინ. 800 ms. 16 fresh release: release-ის შემდეგ 0 escalation, settle 0.07–0.18 წმ (fresh_2: 2nd half-ში maxPostD .221, 14 შემდეგ run-ში არ განმეორდა). **შენიშვნა:** 6 arbitrary run-იდან 2-ში release-დან 21–29 ms-ში მოხდა 1 escalation. Window release-მდე უკვე qualified იყო (d≈−0.2), ამიტომ ეს D-24-ის სწორი შესრულებაა ("≤ T+150" ამას მოითხოვს). კრიტერიუმის ტექსტი "after the forcing stops … no further escalation" B-მ უნდა დააზუსტოს. A-ს 139–160 ms შემთხვევა C-მ ვერ გაიმეორა | `runs/esc6_*.json`, `scripts/esc6.js` |
| **RF6-2** | **FAIL** — §2.1 | `runs/rf62-summary*.txt`, `rf53-summary3.txt` |
| RF6-U | **PASS.** 599 ms → no / 600 ms → yes; persistent-lag ტესტი; D-19/D-24 ტესტები მწვანეა | vitest |
| R27-1 | **PASS.** Seek 5 + რეალური Space → not playing, 5.000, D-27 ტექსტი ზუსტია. Ctrl+V 5.000-ზე ჯდება. ბუნებრივი end-ის შემდეგ Play 0-დან იწყება. Seek 1 → Play 1-დან. Loop 3–4, end 2, pos 3.5 → 3..4-ზე wrap | სესია 1 (`scripts/r27{a,b,c}.js`) |
| R27-U | **PASS** (3 + AudioContext test) | vitest |
| R6-L1 | **PASS.** 1280 და 1440: 9/9 distinct, scrollWidth ≤ clientWidth, ≤ 2 ხაზი; სტემები 4/4 1 ხაზი. Cosmetic: meta row "მუსიკა 00:16.000" 112/110 px-ზე | `runs/l1-*.json`, `list-1280.png`, `list-1440.png` |
| R6-G1 | **PASS.** 1280: video lane და occupied music lane. Label ghost box-შია, clip title-ებს არ კვეთს. Footer reason ერთ ხაზზეა | `runs/g1-*.json`, `ghost-amber-*.png` |
| R6-P1 | **PASS.** `ვიდეო ხაზზე 00:40.000-დან`, arrangement და history უცვლელია | სესია 1 |
| R6-H1 | **PASS.** ორივე ტექსტი სწორ state-შია, 1 ხაზი | `runs/h1-shift.json` |
| R6-D1 | **PASS.** 013/014/015 მხოლოდ C-ს შედეგებს ეყრდნობა, 015-ში PASS claim არ არის. Doc 012-ის ხაზები 4 და 126–127 root M3-ს აკმაყოფილებს | სესია 1 |

### 2.1 RF6-2 დეტალურად (C-R6-02)

Harness: light, D-24 წესებით. სერიები raw და stall-excluded თითო run-ზე. Re-run მხოლოდ INVALID-ზეა დაშვებული (cap 5, გამოყენებულია 2). FAIL run-ები ითვლება.

- **R3-V1, batch 1 (10 same-load + 5 reload):**
  - FAIL: L_7 (ex max **0.178**, app LoAF 26/33/25 ms ArrangementContext rAF), L_8 (0.1025), Lr_2 (0.1154, app LoAF არ აქვს), Lr_3 (0.1135, app 10), Lr_5 (0.1003, app 58);
  - INVALID: L_6 (cover 26 %), L_9 (15 %);
  - დანარჩენი PASS.
- **R3-V1, batch 2 (C-მ ცალკე გაუშვა გარემოს შესამოწმებლად; batch 1-ს არ ცვლის):** L2 10/10 PASS. Lr2 4/5; Lr2_2 FAIL (ex max **0.206**, LoAF 88 ms, აქედან 78 ms app: 62 ms React `performWorkUntilDeadline` + 16 ms ArrangementContext rAF; 0.6 წმ-ზე, Play-ის შემდეგ). Excursion 10.16 წმ-ზე ემთხვევა LoAF-ებს: ArrangementContext 21 ms, VideoDock `step` 22 + Context 25 ms.
- **ჯამი R3-V1:** 30 run → 22 PASS / 6 FAIL / 2 INVALID. Round 5-ში იყო 15/15 valid PASS და **0 app-attributed LoAF**.
- **R2-V3:** 5/5 PASS (swap 0.5/1.0-ზე, 2.0-ზე swap არ არის).
- **RF5-2 loop:** L6_1..5 5/5 PASS (+300 ms-ზე vt ∈ [2.29, 2.31]).
- **RF5-3:** 9 run-იდან 4 სუფთა PASS (F2_1, F2_2, F3_2 და, harness-ის შესწორებით, F2_3).
  - F_1..3 FAIL: `plays:[]`, w2 0.29. Spy-მ `play()` ვერ დაიჭირა, ან video არ დაიწყო. Batch 2-ში იმავე script-ით ეს არ განმეორდა; თუმცა `preAllPaused:true`, `preMaxAbsVt:0` და w2 ≈ 0.29 ნიშნავს, რომ video `startAt`-დან 300 ms-ში რეალურად არ დაიწყო: მხოლოდ spy-ის გამოტოვება 0.29 წმ drift-ს ვერ მისცემდა. Repro-ს მინიშნება: batch 1-ის F run-ები 5 L6 loop run-ს უშუალოდ მოჰყვა, batch 2-ში კი F პირველი გაეშვა.
  - F2_3 `hold:false` harness artifact-ია. Row −0.01-ზე ემთხვევა თავად `play()`-ს, რომელიც დაშვებულ window-შია; media არ წასულა (preMaxAbsVt 0).
  - F3_1 FAIL: `play()` +30 ms-ზე (> 16.7), w2 0.073.
  - F3_3 FAIL: w2 0.0617 > 0.06.
- **გარემო:** CPU 23–100 % (`cpu` ჩანაწერები). ამ სესიაში იზომა **100 %** (Brave, ChatGPT, Edge WebView). `rafcost-1.json`-ის მიხედვით, ArrangementContext-ის rAF tick-ის steady-state ღირებულებაა med 0.1–0.2 ms, max 1.7–7.8 ms. აქედან გამომდინარე, 16–33 ms attribution სავარაუდოდ preemption-ით არის გაბერილი. D-24-ის წესით მაინც app-ს ეთვლება, ხოლო round 5 41 % CPU-ზე 0 app LoAF-ს აჩვენებდა. ამიტომ **ვერდიქტი FAIL-ია**, მაგრამ მიზეზი (app vs გარემო) დადასტურებული არ არის.
- **B-სთვის:**
  - (1) LoAF-ზე attribute-ებული script-ის profile: ArrangementContext rAF + position-store subscriber-ები (overview playhead/frame round 6-ში დაემატა, sync-ად rAF-ში ეშვება) და VideoDock `step`;
  - (2) 62 ms React render Play-ის შემდეგ;
  - (3) Tech Lead quiet-machine RF6-2 (უკვე carried).

## 3. Track U (SRW-10)

| ID | შედეგი | Evidence |
|---|---|---|
| R10-N1 | **PASS.** Ruler, 101 წმ project. Vertical up 100 px 10 წმ-ზე → 40 → 78.3 px/s, anchor err 0.19–0.37 px. Horizontal ±120 px → 0 px. Diagonal → 0.37 px. Position და undo უცვლელია. Click 20 წმ-ზე → pointerdown-ზე 0, release-ზე 20.000, არ უკრავს. Playing-ის დროს click → playback გრძელდება click-ის დროიდან (newStarts [30]) | `runs/n1.json`, `n1b.json` |
| R10-N2 | **PASS.** Ctrl+wheel (synthetic) ×1.15 / ÷1.15, anchor ≤ 0.48 px, `defaultPrevented`. Plain, Shift და library wheel **არ** არის prevented (Lenis fix მუშაობს). სესია 2-ში **რეალური `$B press`**: range 10.025–12.025 → Z → fraction **0.600**, centre err ≈ +0.3 px; X → 40 px/s / scrollLeft 0 ზუსტად; X ცარიელზე → `Zoom-ის ისტორია ცარიელია…`, უცვლელი, ღილაკი disabled + reason title; Z range-ის გარეშე → `Zoom-ისთვის ჯერ მონიშნე მონაკვეთი.`, უცვლელი; `+`, `−`, `=` playhead 6-ზე → playhead x err **0 px**; search-ში ჩაწერილი `zx+-zx` → მხოლოდ ტექსტი იცვლება, view უცვლელია | `runs/n2w.json`, სესია 2 (`scripts/zx*.js`) |
| R10-N3 | **PASS.** Frame width და left err ≤ 0.01 px. Click 60-ზე → centre err −0.24 px, `aria-valuenow` 49. Hdrag და vdrag მათემატიკურად სწორია. Dblclick → Fit (frame = 956 = მთელი overview). სესია 2-ში focused overview + **რეალური** →/→/← → visStart 1.2 → 6.2 → 11.2 → 6.2, `aria-valuenow` 1/6/11/6; მონიშნული clip არ გადაადგილდა (start 0), ახალი history entry არ დაწერილა | `runs/n3.json`, სესია 2 (`scripts/ov*.js`) |
| R10-N4 | **PASS.** Follow scroll-ი edge-თან იწყება (sl 0 → 591), playhead ჩანს. Manual scroll → `Follow ‖`, `aria-pressed=false`, accent და status; view უძრავია. Follow ღილაკი → კვლავ მიჰყვება. Pause + Play → on. Position monotone. Clip drag edge-ზე გადასვლისას: 40 sample-ში sl 0, landing err 0.07 px, ერთი entry, release-ის შემდეგ follow (835). **Follow off:** სესია 1-ის run (`n4.json` `offMode:on`) invalid-ია: harness-მა re-render-მდე წაიკითხა mode და ორჯერ დააჭირა. სესია 2-ში თავიდან შემოწმდა: ერთი click → `off`, `aria-pressed=false`, status; 5.3 წმ-ის განმავლობაში playhead view-დან გავიდა, scrollLeft კი 0 დარჩა; ხელახალი click → on, ხედი playhead-ზე გადავიდა | `runs/n4.json`, `n4b.json`, `follow-off.json` |
| **R10-N5** | **FAIL (Low, C-R6-03).** Fit 05:04-ზე: 2.48 px/s, extent 754 ≤ 758−4, labels min gap 74 px, 0 overlap, overview extent იზრდება (304 → 405). 27 წმ-იანი Fit → ZOOM_MIN 0.5, error არ არის (27 წთ ≥ 20 წთ, ამიტომ extent ვერ ეტევა, რაც მოსალოდნელია). **მაგრამ** scrollWidth 1074 > content 1054.7: ბოლო label `5:30` (`absolute left-1 whitespace-nowrap`) content-ის ბოლოს **19.2 px**-ით სცდება. ეს tail-ის მიღმა overflow-ია. A-ს "92 px = tail" არასწორია: tail = 74 px | `runs/n5.json`, `n5-overflow.json` |
| R10-N6 | **PASS.** Control-ის და nav run-ის starts/stops ტოლია (3/3, 1/1). ±50 ms-ში 0 start/stop. Monotone. Video node-ები იგივეა. |d| max 0.022, 0 write while seeking | `runs/N6_*` |
| R10-N7 | **PASS.** 5 წთ project, Fit ↔ 320 და ±: max LoAF 83 ms, app 0; >200 ms app LoAF არ არის. Waveform დახატულია ორივე zoom-ზე (cap 4096 col) | `runs/n7.json` |
| R10-N8 | **PASS.** 1440: transport ერთი რიგია (h 49). Dock 160×90; overview 956×64 dock-შია, video-ს არ ფარავს. 4 lane, ruler და loop strip ჩანს. Footer 1 ხაზი. 1280: transport wrap-დება (h 87), არაფერი იმალება. 1280 collapsed: overview 1044. `transportRows` counter არასანდოა, ამიტომ განაჩენი height-ით არის. R4-B3: Loop box Δ 0 px 8 state-ში | `runs/n8*.json`, `nav-1440.png`, `nav-1280.png`, `nav-1280-collapsed.png` |
| R10-U | **PASS.** `view.test.ts` 31, render-count და component ტესტები | vitest |

## 4. G6-3 — anonymous / premium auth

- სესია 1: fresh browse context (`c-browse.json`), cookie არ არის, `auth_user` null. Header link-ით `/studio-lab`-ზე client-side გადასვლა. Request-ები: მხოლოდ 2 demo MP3 და `blob:`. GA consent denied. Root `GET /api/cart` known/allowed. `Authorization` header არ არის (`network-anon-nav.txt`).
- სესია 2: import, play, export (×4) და e2e-ის შემდეგ network log-ში studio-token, recording, download და R2 host **არ არის**. Media: `middle-east.mp3`, `hero-music.mp3`, `blob:`.
- `curl /api/studio-token?product=middle-east&file=mix.mp3`:
  - anon → **401** "Please sign in to access Studio.";
  - fake Bearer → **500** "Unable to prepare Studio access", token არ გაიცა (backend 5199 გათიშულია, ამიტომ შედეგი შეზღუდულია, როგორც round 5-ში).
  - A-ს "400" პარამეტრების გარეშე request-იდან მოდის.
- `/studio/middle-east` anon → "Sign in required" (`studio-middle-east-anon.png`).
- **Bypass არ არის.**

## 5. რეალური user flow და G6-R

**E2E (სესია 2, `runs/e2e-userflow.json`, `e2e-play.json`).** Search `ბასი` → 1 შედეგი. Folder სტემები → 4 stem. Preview → 1 live source, `■ შეჩერება`. Drag stems-ზე 10 წმ-ზე → `[stems,10,16]`, undo `დამატება — ღამის პულსი · ბასი`. Beeps video import → `[video,0,6.008]`.

Play 9-დან, master-output tap-ით:
- source `when` = click + 1.061;
- tap onset = click + **1.0587** (bass ზუსტად 1.0 წმ-ის შემდეგ ჟღერს);
- 0.1–0.95 წმ: −240 dB.

Export WAV:
- RIFF/WAVE PCM, 2ch, 48 kHz, 24-bit, **26.000 წმ** (1 248 000 frame);
- 0–6: beeps −19 dB;
- 6.1–10: **−240 dB**;
- bass onset **10.000125 წმ**.

**R5-B1r / R3-V3 (r3v3c, სესია 2 თავიდან, `runs/r3v3c.json`).** Trim 0.5 → move 2.000. Export 101.352 წმ, 24-bit/48k/2ch.
- video-only oracle max **5.96e-8** (24-bit quantization);
- wrong-offset diff 0.507 (offset მნიშვნელოვანია);
- onsets 2.5/3.5/4.5/5.5/6.5;
- muted → music oracle 1.19e-7;
- linearity **1.19e-7**;
- dialog line "შედის / გამორთულია (M/Solo)".
- **PASS.**

**G6-R — თავიდან გაშვებული და PASS:**
- R1-B8 (n1)
- R1-B10 (undo chain)
- R1-B12 (reg b12: continuity 0 sample)
- R1-E1 (export 15 წმ, 24-bit, regions)
- R1-E5 (oracle 5.96e-8)
- R2-V2 (v2: wav, broken, pdf, webm→music და სხვ. უარყოფილია, history უცვლელია; mov მიიღება)
- R3-V3 (= R5-B1r)
- R4-P1 (p1post: 0 write while seeking)
- R4-P3 (R27-1)
- R4-M2 (m2: per-frame მხოლოდ position node-ები, overview-ს ჩათვლით style)
- R4-B3 (n8states)
- R4-B4, R4-B5, R4-B6 (Web Audio-ს გარეშე: status, error არ არის), R4-B7
- R5-L1, R5-L2, R5-E1, R6-S2, R6-S3, R6-S4 (r5r6)
- R6-S1 (misc)
- R7-D1, R9-C1..C3 (edits: export compare maxDiff 0)
- R9-C4 (misc)
- R8-M1 + R8-M5 დაკვრისას Follow on-ით (m5f: Ctrl+Z blocked, landing, sl 0 drag-ის დროს)
- R8-M2 (h1-shift)
- R11A-1 (სუფთა layout, |d| ≤ 0.024; სესია 1-ის 2.0 მნიშვნელობა სხვა layout-ის offset artifact იყო)
- R11A-3 (hint 1 ხაზი)
- R12-L1 (`ბასი დემო` = `დემო ბასი` = 1, `zzz` → ვერ მოიძებნა)
- R12-L3 (preview ↔ transport)
- R12-S2 (e2e)
- R22-1 (= G6-3)

**G6-R — round 6-ში თავიდან არ გაშვებულა (PASS არ არის, B-მ გადაიტანოს):**
- R1-B5, R2-V1, R3-V2, R3-V4
- R4-B1 (D-26-ით ნაწილობრივ R26-2 ფარავს)
- R5-L3, R5-L4, R5-L5, R6-S5
- R7-D2..D5, R8-M3, R8-M4, R9-C5
- R11A-2: გაშვებულია მხოლოდ pointer-ის ნაწილი (sepdrag 288 → 480); keys არ გაშვებულა.
- R12-L2, R12-L4, R5-B5, R5-B1u

## 6. ბაგები (B-სთვის)

1. **C-R6-02 (Medium) — RF6-2 drift regression** (§2.1). Repro: `c-round-6/drift.sh` + `c-round-5/scripts/rf5.js`/`rf5an.js`, R3-V1 (`scripts/r3v1lay.js`), 13 წმ. Expected: ყოველი valid run ex max ≤ 0.1. Actual: 6/28 valid FAIL, app LoAF-ებით. Evidence: `runs/L_*`, `Lr_*`, `Lr2_*`, `*_raw.json` (LoAF srcs).
2. **C-R6-03 (Low) — Fit-ის შემდეგ ბოლო ruler label tail-ის მიღმა overflow-ს ქმნის.** Repro: 1280×720, Middle East music-ზე, Ctrl+D ×2, Fit → `scrollWidth − contentWidth = 19 px` (label `5:30`). ცარიელ project-ზე: 31.6 px (label `0:30`). Expected: tail-ის მიღმა overflow არ არის (მაგ. ბოლო label clip-დება ან right-anchored ხდება). Evidence: `runs/n5-overflow.json`, `scripts/n5o.js`, `scripts/n5o2.js`.
3. **C-R6-01 (Low) — gesture-მდე დაწყებული Volume preview commit-დება clip gesture-ის შუაში და "Volume" entry-ს წერს** (D-26 rule 3-ის commit path). Data loss არ არის, undo chain თანმიმდევრულია. ემთხვევა root review #10-ს. Evidence: `runs/volpre.json`, `scripts/volpre.js`.

Notes (bug არ არის): stale scrub abort-ზე position ინარჩუნებს (review #6, მისაღებია). Marquee-ს `buttons` check არ აქვს (review #7). Library meta row-ში 2 px cosmetic overflow.

## 7. Carried follow-ups (root review / publication checkpoint / checkpoint-r6-review)

- Purchased `/studio/:product` loader-ში middle-east hardcoded-ია (inherited; SRW-21 adapter). Entitlement policy უცვლელია.
- Lenis `/studio/*`-ზე: A-ს `data-lenis-prevent` მხოლოდ `/studio-lab`-ზეა. Purchased Studio-ს wheel B-მ შეამოწმოს (protected).
- Instruction file-ების portable-path follow-up (all-files-review).
- Tech Lead real-Chrome / real-mouse ჩამონათვალი:
  - R23-1/R23-2 scrollbar;
  - R12-L4 HTML5 DnD;
  - RF6-1/RF6-2 quiet machine (VP9 + H.264), ახლა **აუცილებელია** C-R6-02-ის გამო;
  - R8-M1/M2;
  - R10-N1/N2 real mouse, Ctrl+wheel და pinch.
- checkpoint-r6-review-ის ღია punkt-ები:
  - #6 stale scrub;
  - #7 marquee buttons;
  - #10 `commitTrackVolume` (= C-R6-01).
- Root pre-push review-ის Low punkt-ები, C-მ round 6-ში თავიდან არ გადაამოწმა:
  - L2 `holdUntil` reschedule-ზე;
  - L3 Delete `event.repeat`;
  - L7 unbounded history.
- T12 Gain/Volume: არ დაწყებულა (publication-checkpoint-ის მიხედვით, original scope-ის შემდეგ).
- RF6-1-ის კრიტერიუმის ტექსტი ("no further escalation after forcing stops") B-მ უნდა დააზუსტოს: release-ის მომენტში უკვე qualified window-ზე escalation სწორი ქცევაა.

## 8. Harness limits

- Ctrl+wheel: synthetic `WheelEvent` (gstack-ს wheel არ აქვს).
- R26-* და R10-N1/N3 pointer-ები synthetic-ია (`buttons:1`); ფიზიკური multi-touch არ შემოწმებულა.
- Z/X, +/−/=, overview-ის ←/→ და search typing **რეალური** `$B press`/`$B type`-ით.
- Headless Chromium დატვირთულ Windows-ზე (CPU 23–100 %).

Artifact-ები: `tmp/studio-real-loop/c-round-6/` (runs/, scripts/, PNG, media/), `c-round-6.json`.
